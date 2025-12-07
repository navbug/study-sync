'use client';

import { logoutUser } from '@/lib/actions/auth';
import Button from '@/components/ui/Button';

export default function LogoutButton() {
  return (
    <form action={logoutUser}>
      <Button variant="ghost" type="submit">
        Logout
      </Button>
    </form>
  );
}