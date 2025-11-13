export class CPF {
    private readonly value: string;
  
    constructor(cpf: string) {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      if (!this.isValid(cleanCPF)) {
        throw new Error('Invalid CPF');
      }
      
      this.value = cleanCPF;
    }
  
    private isValid(cpf: string): boolean {
      if (cpf.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(cpf)) return false;
  
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (digit !== parseInt(cpf.charAt(9))) return false;
  
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (digit !== parseInt(cpf.charAt(10))) return false;
  
      return true;
    }
  
    getValue(): string {
      return this.value;
    }
  
    getFormatted(): string {
      return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  
    equals(other: CPF): boolean {
      return this.value === other.value;
    }
  }