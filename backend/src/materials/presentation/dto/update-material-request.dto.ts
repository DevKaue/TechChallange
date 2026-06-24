import { PartialType } from '@nestjs/swagger';
import CreateMaterialRequestDto from '@materials/presentation/dto/create-material-request.dto';
import UpdateMaterialInputDTO from '@materials/application/dtos/update-material-input.dto';

export default class UpdateMaterialRequestDto
  extends PartialType(CreateMaterialRequestDto)
  implements Omit<UpdateMaterialInputDTO, 'id'> {}
