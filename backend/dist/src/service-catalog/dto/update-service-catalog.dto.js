"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateServiceCatalogDto = void 0;
const openapi = require("@nestjs/swagger");
const mapped_types_1 = require("@nestjs/mapped-types");
const create_service_catalog_dto_1 = require("./create-service-catalog.dto");
class UpdateServiceCatalogDto extends (0, mapped_types_1.PartialType)(create_service_catalog_dto_1.CreateServiceCatalogDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateServiceCatalogDto = UpdateServiceCatalogDto;
//# sourceMappingURL=update-service-catalog.dto.js.map