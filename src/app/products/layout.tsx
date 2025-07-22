import { Header } from "@/components/layout/header";

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={{ username: 'mike' }} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
