"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePartDto = void 0;
const openapi = require("@nestjs/swagger");
const mapped_types_1 = require("@nestjs/mapped-types");
const create_part_dto_1 = require("./create-part.dto");
class UpdatePartDto extends (0, mapped_types_1.PartialType)(create_part_dto_1.CreatePartDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdatePartDto = UpdatePartDto;
//# sourceMappingURL=update-part.dto.js.map