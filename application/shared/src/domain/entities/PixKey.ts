import { v4 as uuidv4 } from 'uuid';

export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';

export interface PixKeyProps {
  pixKeyId: string;
  accountId: string;
  pixKey: string;
  pixKeyType: PixKeyType;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
}

export class PixKey {
  private props: PixKeyProps;

  private constructor(props: PixKeyProps) {
    this.props = props;
  }

  static create(accountId: string, pixKey: string, pixKeyType: PixKeyType): PixKey {
    return new PixKey({
      pixKeyId: uuidv4(),
      accountId,
      pixKey,
      pixKeyType,
      status: 'ACTIVE',
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

  get pixKey(): string {
    return this.props.pixKey;
  }

  get pixKeyType(): PixKeyType {
    return this.props.pixKeyType;
  }

  get status(): string {
    return this.props.status;
  }

  deactivate(): void {
    this.props.status = 'INACTIVE';
  }

  toJSON() {
    return {
      pixKeyId: this.props.pixKeyId,
      accountId: this.props.accountId,
      pixKey: this.props.pixKey,
      pixKeyType: this.props.pixKeyType,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}