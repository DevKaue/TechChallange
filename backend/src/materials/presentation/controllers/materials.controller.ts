import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import AddMaterialStockInputDTO from '@materials/application/dtos/add-material-stock-input.dto';
import FindMaterialByIdInputDTO from '@materials/application/dtos/find-material-by-id-input.dto';
import UpdateMaterialInputDTO from '@materials/application/dtos/update-material-input.dto';
import AddMaterialStockUseCase from '@materials/application/usecases/add-material-stock.usecase';
import CreateMaterialUseCase from '@materials/application/usecases/create-material.usecase';
import DeleteMaterialUseCase from '@materials/application/usecases/delete-material.usecase';
import FindMaterialByIdUseCase from '@materials/application/usecases/find-material-by-id.usecase';
import ListMaterialsUseCase from '@materials/application/usecases/list-materials.usecase';
import UpdateMaterialUseCase from '@materials/application/usecases/update-material.usecase';
import AddMaterialStockRequestDto from '@materials/presentation/dto/add-material-stock-request.dto';
import CreateMaterialRequestDto from '@materials/presentation/dto/create-material-request.dto';
import MaterialResponseDto from '@materials/presentation/dto/material-response.dto';
import UpdateMaterialRequestDto from '@materials/presentation/dto/update-material-request.dto';
import { MaterialExceptionFilter } from '@materials/presentation/filters/material-exception.filter';
import {
  JsonMaterialPresenter,
  MaterialResponse,
} from '@materials/presentation/presenters/json-material.presenter';

@ApiTags('Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(MaterialExceptionFilter)
@Controller(['materials'])
export class MaterialsController {
  constructor(
    private readonly createMaterialUseCase: CreateMaterialUseCase,
    private readonly listMaterialsUseCase: ListMaterialsUseCase,
    private readonly findMaterialByIdUseCase: FindMaterialByIdUseCase,
    private readonly updateMaterialUseCase: UpdateMaterialUseCase,
    private readonly addMaterialStockUseCase: AddMaterialStockUseCase,
    private readonly deleteMaterialUseCase: DeleteMaterialUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateMaterialRequestDto })
  @ApiCreatedResponse({
    description: 'Material cadastrado com sucesso',
    type: MaterialResponseDto,
  })
  async create(
    @Body() input: CreateMaterialRequestDto,
  ): Promise<MaterialResponse> {
    const output = await this.createMaterialUseCase.execute(input);

    return JsonMaterialPresenter.present(output.material);
  }

  @Get()
  @ApiOkResponse({
    description: 'Materiais encontrados com sucesso',
    type: MaterialResponseDto,
    isArray: true,
  })
  async findAll(): Promise<MaterialResponse[]> {
    const output = await this.listMaterialsUseCase.execute();

    return output.materials.map((material) =>
      JsonMaterialPresenter.present(material),
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do material', type: String })
  @ApiOkResponse({
    description: 'Material encontrado com sucesso',
    type: MaterialResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Material nao encontrado' })
  async findById(@Param('id') id: string): Promise<MaterialResponse> {
    const output = await this.findMaterialByIdUseCase.execute(
      new FindMaterialByIdInputDTO({ id }),
    );

    return JsonMaterialPresenter.present(output.material);
  }

  @Patch(':id/stock')
  @ApiParam({ name: 'id', description: 'ID do material', type: String })
  @ApiBody({ type: AddMaterialStockRequestDto })
  @ApiOkResponse({
    description: 'Estoque atualizado com sucesso',
    type: MaterialResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Material nao encontrado' })
  async addStock(
    @Param('id') id: string,
    @Body() input: AddMaterialStockRequestDto,
  ): Promise<MaterialResponse> {
    const output = await this.addMaterialStockUseCase.execute({
      id,
      quantity: input.quantity,
    } satisfies AddMaterialStockInputDTO);

    return JsonMaterialPresenter.present(output.material);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'ID do material', type: String })
  @ApiBody({ type: UpdateMaterialRequestDto })
  @ApiOkResponse({
    description: 'Material atualizado com sucesso',
    type: MaterialResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Material nao encontrado' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateMaterialRequestDto,
  ): Promise<MaterialResponse> {
    const output = await this.updateMaterialUseCase.execute({
      id,
      ...input,
    } satisfies UpdateMaterialInputDTO);

    return JsonMaterialPresenter.present(output.material);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID do material', type: String })
  @ApiOkResponse({
    description: 'Material removido com sucesso',
    type: MaterialResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Material nao encontrado' })
  async remove(@Param('id') id: string): Promise<MaterialResponse> {
    const output = await this.deleteMaterialUseCase.execute(
      new FindMaterialByIdInputDTO({ id }),
    );

    return JsonMaterialPresenter.present(output.material);
  }
}
