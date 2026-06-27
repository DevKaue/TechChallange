import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import {
  loginAsAttendant,
  loginAsMechanic,
  authHeader,
} from './setup/auth.helper';
import { PrismaService } from '@/prisma/prisma.service';
import { ServiceOrderStatus } from '@/service-orders/domain/enums/service-order-status.enum';

describe('Service Orders (e2e)', () => {
  let testApp: TestApp;
  let prisma: PrismaService;
  let seed: SeedData;
  let attendantToken: string;
  let mechanicToken: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    prisma = testApp.prisma;
    seed = await seedTestData(prisma);
    const auth = await loginAsAttendant(testApp.app);
    attendantToken = auth.token;
    const mechAuth = await loginAsMechanic(testApp.app);
    mechanicToken = mechAuth.token;
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('POST /api/service-orders', () => {
    it('should create a service order', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('should return 404 for non-existent customerId', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: '00000000-0000-0000-0000-000000000000',
          vehicleId: seed.vehicle1Id,
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/service-orders', () => {
    it('should list service orders', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/service-orders')
        .set(authHeader(attendantToken))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 without token', async () => {
      const res = await request(testApp.app.getHttpServer()).get(
        '/api/service-orders',
      );

      expect(res.status).toBe(401);
    });
  });

  describe('Full lifecycle', () => {
    let osId: string;

    it('1. Create OS → RECEIVED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
        })
        .expect(201);

      osId = res.body.id;
      expect(res.body.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('2. Assign Mechanic (still RECEIVED)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/mechanic`)
        .set(authHeader(attendantToken))
        .send({ mechanicId: seed.mechanic1Id })
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('3. Start Diagnosis → IN_DIAGNOSIS', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/diagnosis`)
        .set(authHeader(attendantToken))
        .send({ diagnosis: 'Freio dianteiro com desgaste excessivo' })
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('4. Create Estimate → WAITING_APPROVAL', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(attendantToken))
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('PENDING');
    });

    it('5. Add Estimate Items', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .get(`/api/service-orders/${osId}`)
        .set(authHeader(attendantToken));

      const estimateId = osRes.body.estimates[0].id;

      const partItemResponse = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(attendantToken))
        .send({
          itemType: 'PART',
          referenceId: seed.part1Id,
          quantity: 2,
        });

      const serviceItemResponse = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(attendantToken))
        .send({
          itemType: 'SERVICE',
          referenceId: seed.service1Id,
          quantity: 1,
        });

      expect(partItemResponse.status).toBe(201);
      expect(serviceItemResponse.status).toBe(201);
    });

    it('6. Approve Estimate → IN_EXECUTION', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .get(`/api/service-orders/${osId}`)
        .set(authHeader(attendantToken));

      const estimateId = osRes.body.estimates[0].id;

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/estimates/${estimateId}/status`)
        .set(authHeader(attendantToken))
        .send({ status: 'APPROVED' })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('7. Finish Service → FINISHED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/finish`)
        .set(authHeader(mechanicToken))
        .send({ notes: 'Serviço concluído com sucesso' })
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.FINISHED);
    });

    it('8. Deliver Vehicle → DELIVERED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/deliver`)
        .set(authHeader(attendantToken))
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.DELIVERED);
    });

    it('9. Close OS → CLOSED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/close`)
        .set(authHeader(attendantToken))
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.CLOSED);
    });

    it('10. Get OS detail with full history', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/api/service-orders/${osId}`)
        .set(authHeader(attendantToken))
        .expect(200);

      expect(res.body.id).toBe(osId);
      expect(res.body.status).toBe(ServiceOrderStatus.CLOSED);
      expect(Array.isArray(res.body.status_history)).toBe(true);
      expect(res.body.status_history.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('GET /api/service-orders/:id', () => {
    it('should return 404 for non-existent OS', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/service-orders/00000000-0000-0000-0000-000000000000')
        .set(authHeader(attendantToken));

      expect(res.status).toBe(404);
    });
  });
});
