import { v4 as uuidv4 } from 'uuid';

export interface UserProps {
  userId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  cpf: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(data: Omit<UserProps, 'userId' | 'createdAt' | 'updatedAt'>): User {
    const now = new Date();
    return new User({
      ...data,
      userId: uuidv4(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get cpf(): string {
    return this.props.cpf;
  }

  get phone(): string {
    return this.props.phone;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      userId: this.props.userId,
      email: this.props.email,
      fullName: this.props.fullName,
      cpf: this.props.cpf,
      phone: this.props.phone,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}