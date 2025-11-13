export class Money {
    private readonly amount: number;
  
    constructor(amount: number) {
      if (amount < 0) {
        throw new Error('Amount cannot be negative');
      }
      this.amount = Math.round(amount * 100) / 100; // 2 decimal places
    }
  
    getValue(): number {
      return this.amount;
    }
  
    add(other: Money): Money {
      return new Money(this.amount + other.amount);
    }
  
    subtract(other: Money): Money {
      return new Money(this.amount - other.amount);
    }
  
    isGreaterThan(other: Money): boolean {
      return this.amount > other.amount;
    }
  
    isGreaterOrEqual(other: Money): boolean {
      return this.amount >= other.amount;
    }
  
    equals(other: Money): boolean {
      return this.amount === other.amount;
    }
  
    toJSON(): number {
      return this.amount;
    }
  }