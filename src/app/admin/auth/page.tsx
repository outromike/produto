
import { redirect } from "next/navigation";

// This page is a safeguard. The actual protection is in the layout.
// If a user ever lands here, it means they are not an admin.
// We redirect them to the main dashboard.
export default function AdminAuthPage() {
    redirect('/dashboard');
}
