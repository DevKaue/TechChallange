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
import AddPartStockInputDTO from '@parts/application/dtos/add-part-stock-input.dto';
import FindPartByIdInputDTO from '@parts/application/dtos/find-part-by-id-input.dto';
import UpdatePartInputDTO from '@parts/application/dtos/update-part-input.dto';
import AddPartStockUseCase from '@parts/application/usecases/add-part-stock.usecase';
import CreatePartUseCase from '@parts/application/usecases/create-part.usecase';
import DeletePartUseCase from '@parts/application/usecases/delete-part.usecase';
import FindPartByIdUseCase from '@parts/application/usecases/find-part-by-id.usecase';
import ListPartsUseCase from '@parts/application/usecases/list-parts.usecase';
import UpdatePartUseCase from '@parts/application/usecases/update-part.usecase';
import AddPartStockRequestDto from '@parts/presentation/dto/add-part-stock-request.dto';
import CreatePartRequestDto from '@parts/presentation/dto/create-part-request.dto';
import PartResponseDto from '@parts/presentation/dto/part-response.dto';
import UpdatePartRequestDto from '@parts/presentation/dto/update-part-request.dto';
import { PartExceptionFilter } from '@parts/presentation/filters/part-exception.filter';
import {
  JsonPartPresenter,
  PartResponse,
} from '@parts/presentation/presenters/json-part.presenter';

@ApiTags('Parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(PartExceptionFilter)
@Controller('parts')
export class PartsController {
  constructor(
    private readonly createPartUseCase: CreatePartUseCase,
    private readonly listPartsUseCase: ListPartsUseCase,
    private readonly findPartByIdUseCase: FindPartByIdUseCase,
    private readonly updatePartUseCase: UpdatePartUseCase,
    private readonly addPartStockUseCase: AddPartStockUseCase,
    private readonly deletePartUseCase: DeletePartUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreatePartRequestDto })
  @ApiCreatedResponse({
    description: 'Peca cadastrada com sucesso',
    type: PartResponseDto,
  })
  async create(@Body() input: CreatePartRequestDto): Promise<PartResponse> {
    const output = await this.createPartUseCase.execute(input);

    return JsonPartPresenter.present(output.part);
  }

  @Get()
  @ApiOkResponse({
    description: 'Pecas encontradas com sucesso',
    type: PartResponseDto,
    isArray: true,
  })
  async findAll(): Promise<PartResponse[]> {
    const output = await this.listPartsUseCase.execute();

    return output.parts.map((part) => JsonPartPresenter.present(part));
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID da peca', type: String })
  @ApiOkResponse({
    description: 'Peca encontrada com sucesso',
    type: PartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Peca nao encontrada' })
  async findById(@Param('id') id: string): Promise<PartResponse> {
    const output = await this.findPartByIdUseCase.execute(
      new FindPartByIdInputDTO({ id }),
    );

    return JsonPartPresenter.present(output.part);
  }

  @Patch(':id/stock')
  @ApiParam({ name: 'id', description: 'ID da peca', type: String })
  @ApiBody({ type: AddPartStockRequestDto })
  @ApiOkResponse({
    description: 'Estoque atualizado com sucesso',
    type: PartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Peca nao encontrada' })
  async addStock(
    @Param('id') id: string,
    @Body() input: AddPartStockRequestDto,
  ): Promise<PartResponse> {
    const output = await this.addPartStockUseCase.execute({
      id,
      quantity: input.quantity,
    } satisfies AddPartStockInputDTO);

    return JsonPartPresenter.present(output.part);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'ID da peca', type: String })
  @ApiBody({ type: UpdatePartRequestDto })
  @ApiOkResponse({
    description: 'Peca atualizada com sucesso',
    type: PartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Peca nao encontrada' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePartRequestDto,
  ): Promise<PartResponse> {
    const output = await this.updatePartUseCase.execute({
      id,
      ...input,
    } satisfies UpdatePartInputDTO);

    return JsonPartPresenter.present(output.part);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID da peca', type: String })
  @ApiOkResponse({
    description: 'Peca removida com sucesso',
    type: PartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Peca nao encontrada' })
  async remove(@Param('id') id: string): Promise<PartResponse> {
    const output = await this.deletePartUseCase.execute(
      new FindPartByIdInputDTO({ id }),
    );

    return JsonPartPresenter.present(output.part);
  }
}
