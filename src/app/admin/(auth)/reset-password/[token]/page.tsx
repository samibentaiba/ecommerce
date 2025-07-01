import { redirect } from 'next/navigation';
import ResetPasswordForm from '@/components/admin/client/form';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token) {
    redirect('/login');
  }

  return <ResetPasswordForm token={token} />;
}
