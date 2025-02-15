'use client'
import { createResource, updateResource } from "@/app/actions/actions";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoaderButton } from "@/components/ui/LoadingSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const serviceAccountPlaceholder = `{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",,
  "client_x509_cert_url": "...",
  "universe_domain": "..."
}
`

const FormSchema = z.object({
    name: z.string().min(2, {
        message: "Name can't be empty",
    }),
    host: z.string().min(1, {
        message: "Hostname account can't be empty",
    }),
    port: z.number().min(1, {
        message: "Port can't be empty",
    }),
    database: z.string().min(1, {
        message: "Database can't be empty",
    }),
    username: z.string().min(1, {
        message: "Username can't be empty",
    }),
    password: z.string().min(1, {
        message: "Password can't be empty",
    }),
})

export default function PostgresForm({ resource, details }: { resource?: any, details?: any }) {
    const router = useRouter()


    console.log({ resource })
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: resource?.name || "",
            host: details?.host || "",
            port: details?.port || 5432,
            database: details?.database || "",
            username: details?.username || "",
            password: details?.password || "",
        },
    })



    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const isUpdate = resource?.id

        const payload = {
            resource: {
                name: data.name,
                type: 'db',
            },
            ...(isUpdate ? {} : { subtype: 'postgres' }),
            config: {
                host: data.host,
                port: data.port,
                database: data.database,
                username: data.username,
                password: data.password,
            }
        }
        const res = isUpdate ? await updateResource(resource.id, payload) : await createResource(payload as any)
        if (res.ok && resource?.id) {
            toast.success('Connection updated')
            router.push(`/connections/${resource.id}`)
        }
        else if (res.id) {
            router.push(`/connections/`)
        }
    }


    return (
        <div className='w-full max-w-2xl'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-black">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Connection name</FormLabel>
                                <FormControl>
                                    <Input placeholder="my awesome connection" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='flex space-x-4 w-full'>
                        <div className='flex-grow'>
                            <FormField
                                control={form.control}
                                name="host"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hostname</FormLabel>
                                        <FormControl>
                                            <Input placeholder="host.turntable.so" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-shrink ">
                            <FormField
                                control={form.control}
                                name="port"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Port</FormLabel>
                                        <FormControl>
                                            <Input type='number' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="database"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Database</FormLabel>
                                <FormControl>
                                    <Input type='text' placeholder="production_database" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='flex space-x-4 w-full'>
                        <div className='flex-grow'>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-grow">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type='password' placeholder="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end'>
                        <LoaderButton type='submit'>
                            Save
                        </LoaderButton>
                    </div>
                </form>
            </Form>
        </div >
    )
}