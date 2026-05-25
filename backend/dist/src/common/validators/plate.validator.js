"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidPlateConstraint = void 0;
exports.IsValidPlate = IsValidPlate;
const class_validator_1 = require("class-validator");
let IsValidPlateConstraint = class IsValidPlateConstraint {
    validate(value, args) {
        if (typeof value !== 'string')
            return false;
        const cleanPlate = value.trim().toUpperCase();
        const traditionalRegex = /^[A-Z]{3}-?[0-9]{4}$/;
        const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
        return traditionalRegex.test(cleanPlate) || mercosulRegex.test(cleanPlate);
    }
    defaultMessage(args) {
        return 'A placa do veículo deve ser válida no formato brasileiro tradicional (AAA-9999) ou Mercosul (AAA9A99).';
    }
};
exports.IsValidPlateConstraint = IsValidPlateConstraint;
exports.IsValidPlateConstraint = IsValidPlateConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidPlate', async: false })
], IsValidPlateConstraint);
function IsValidPlate(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isValidPlate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsValidPlateConstraint,
        });
    };
}
//# sourceMappingURL=plate.validator.js.map