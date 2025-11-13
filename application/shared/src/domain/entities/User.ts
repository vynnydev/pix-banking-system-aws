import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface UserProps {
  userId: string;
  name: string;
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  // ✅ CORRIGIR: Retorno deve ser Promise<User>, não o tipo do parâmetro
  static async create(data: {
    name: string;
    email: string;
    fullName: string;
    cpf: string;
    phone: string;
    password: string;
  }): Promise<User> {  // ← Tipo de retorno explícito
    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date();

    return new User({
      userId: uuidv4(),
      name: data.name,
      email: data.email,
      fullName: data.fullName,
      cpf: data.cpf,
      phone: data.phone,
      passwordHash,
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

  get name(): string {
    return this.props.name;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get email(): string {
    return this.props.email;
  }

  get cpf(): string {
    return this.props.cpf;
  }

  get phone(): string {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.props.passwordHash);
  }

  toJSON() {
    return {
      userId: this.props.userId,
      name: this.props.name,
      email: this.props.email,
      fullName: this.props.fullName,
      cpf: this.props.cpf,
      phone: this.props.phone,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}