import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UserForm } from "@/components/admin/user-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/8bit/breadcrumb"

export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await prisma.user.findFirst({
    where: { id: params.id },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div>
        <h1 className="text-xl font-black tracking-wider text-foreground uppercase">
          EDIT USER
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update operative credentials and standing
        </p>
      </div>

      <UserForm initialData={user} />
    </div>
  )
}
