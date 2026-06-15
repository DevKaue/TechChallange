import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';

export class Vehicle {
    private _licensePlate: LicensePlate;
    private _brand: string;
    private _model: string;
    private _year: number;

    constructor(licensePlate: LicensePlate, brand: string, model: string, year: number) {
        this._licensePlate = licensePlate;
        this._brand = brand;
        this._model = model;
        this._year = year;
    }

    // Getters
    public get licensePlate(): string {
        return this._licensePlate.value;
    }

    public get brand(): string {
        return this._brand;
    }

    public get model(): string {
        return this._model;
    }

    public get year(): number {
        return this._year;
    }
}