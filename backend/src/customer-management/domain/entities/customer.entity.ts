import Document from '@customer-management/domain/value-objects/document.vo';
import Email from '@customer-management/domain/value-objects/email.vo';

export type CustomerProps = {
  id: string;
  document: Document;
  name: string;
  phone?: string;
  email?: Email;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export default class Customer {
  private _id: string;
  private _document: Document;
  private _name: string;
  private _phone?: string;
  private _email?: Email;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date;

  constructor({
    id,
    document,
    name,
    phone,
    email,
    createdAt,
    updatedAt,
    deletedAt,
  }: CustomerProps) {
    this._id = id;
    this._document = document;
    this._name = name;
    this._phone = phone;
    this._email = email;
    this._deletedAt = deletedAt;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
  }

  // Getters
  public get id(): string {
    return this._id;
  }

  public get document(): Document {
    return this._document;
  }

  public get phone(): string | undefined {
    return this._phone;
  }

  public get email(): Email | undefined {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  public isArchived(): boolean {
    return this._deletedAt !== undefined;
  }

  // Methods
  public update(props: { name?: string; phone?: string; email?: Email }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.phone !== undefined) {
      this._phone = props.phone;
    }
    if (props.email !== undefined) {
      this._email = props.email;
    }
    this._updatedAt = new Date();
  }

  public softDelete(): void {
    this._deletedAt = new Date();
  }
}
