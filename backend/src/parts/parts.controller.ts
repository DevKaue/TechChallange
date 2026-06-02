import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PartResponseDto } from './dto/part-response.dto';

@ApiTags('Parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @ApiCreatedResponse({ type: PartResponseDto })
  create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  @Get()
  @ApiOkResponse({ type: PartResponseDto, isArray: true })
  findAll() {
    return this.partsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: PartResponseDto })
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: PartResponseDto })
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return this.partsService.update(id, updatePartDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PartResponseDto })
  remove(@Param('id') id: string) {
    return this.partsService.remove(id);
  }
}
