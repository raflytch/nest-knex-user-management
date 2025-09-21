export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}
