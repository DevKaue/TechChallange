import { PartialType } from '@nestjs/swagger';
import CreatePartRequestDto from '@parts/presentation/dto/create-part-request.dto';
import UpdatePartInputDTO from '@parts/application/dtos/update-part-input.dto';

export default class UpdatePartRequestDto
  extends PartialType(CreatePartRequestDto)
  implements Omit<UpdatePartInputDTO, 'id'> {}
