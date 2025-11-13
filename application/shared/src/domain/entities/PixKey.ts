import { v4 as uuidv4 } from 'uuid';

export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';

export interface PixKeyProps {
  pixKeyId: string;
  accountId: string;
  keyType: PixKeyType;
  keyValue: string;
  createdAt: Date;
}

export class PixKey {
  private props: PixKeyProps;

  private constructor(props: PixKeyProps) {
    this.props = props;
  }

  static create(data: {
    accountId: string;
    keyType: PixKeyType;
    keyValue: string;
  }): PixKey {
    return new PixKey({
      pixKeyId: uuidv4(),
      accountId: data.accountId,
      keyType: data.keyType,
      keyValue: data.keyValue,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: PixKeyProps): PixKey {
    return new PixKey(props);
  }

  get pixKeyId(): string {
    return this.props.pixKeyId;
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get keyType(): PixKeyType {
    return this.props.keyType;
  }

  get keyValue(): string {
    return this.props.keyValue;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON() {
    return {
      pixKeyId: this.props.pixKeyId,
      accountId: this.props.accountId,
      keyType: this.props.keyType,
      keyValue: this.props.keyValue,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}