import { PartialType } from '@nestjs/swagger';
import CreateMaterialRequestDto from '@materials/presentation/dto/create-material-request.dto';
import type { UpdateMaterialInput } from '@materials/application/usecases/update-material.usecase';

export default class UpdateMaterialRequestDto
  extends PartialType(CreateMaterialRequestDto)
  implements Omit<UpdateMaterialInput, 'id'> {}
