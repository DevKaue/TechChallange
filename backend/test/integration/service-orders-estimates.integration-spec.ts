import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/prisma/prisma.service';

describe('Service Orders - Estimates (e2e)', () => {
  let testApp: TestApp;
  let prisma: PrismaService;
  let seed: SeedData;
  let token: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    prisma = testApp.prisma;
    seed = await seedTestData(prisma);
    const auth = await loginAsAttendant(testApp.app);
    token = auth.token;
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  async function createAndDiagnoseOS(): Promise<string> {
    const osRes = await request(testApp.app.getHttpServer())
      .post('/api/service-orders')
      .set(authHeader(token))
      .send({ customerId: seed.customer1Id, vehicleId: seed.vehicle1Id });

    const osId = osRes.body.id;

    await request(testApp.app.getHttpServer())
      .patch(`/api/service-orders/${osId}/diagnosis`)
      .set(authHeader(token))
      .send({ diagnosis: 'Diagnóstico para teste de orçamento' });

    return osId;
  }

  describe('Estimate CRUD', () => {
    it('should create estimate for diagnosed OS', async () => {
      const osId = await createAndDiagnoseOS();

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token))
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('PENDING');
    });

    it('should add PART item to estimate', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const estimateId = estRes.body.id;

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(token))
        .send({
          itemType: 'PART',
          referenceId: seed.part1Id,
          quantity: 3,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.itemType).toBe('PART');
      expect(res.body.quantity).toBe(3);
    });

    it('should add SERVICE item to estimate', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const estimateId = estRes.body.id;

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(token))
        .send({
          itemType: 'SERVICE',
          referenceId: seed.service1Id,
          quantity: 2,
        })
        .expect(201);

      expect(res.body.itemType).toBe('SERVICE');
      expect(res.body.quantity).toBe(2);
    });

    it('should approve estimate', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/estimates/${estRes.body.id}/status`)
        .set(authHeader(token))
        .send({ status: 'APPROVED' })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('should reject estimate via status endpoint', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/estimates/${estRes.body.id}/status`)
        .set(authHeader(token))
        .send({ status: 'REJECTED' })
        .expect(200);

      expect(res.body.status).toBe('REJECTED');
    });

    it('should reject estimate via /reject endpoint (returns to diagnosis)', async () => {
      const osId = await createAndDiagnoseOS();

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/reject`)
        .set(authHeader(token))
        .send({ reason: 'Preço muito alto' })
        .expect(200);

      expect(res.body.status).toBe('IN_DIAGNOSIS');
    });
  });
});
