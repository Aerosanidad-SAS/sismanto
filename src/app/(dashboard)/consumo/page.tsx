import { redirect } from "next/navigation";


export const metadata = { title: "Consumo" };

export default function ConsumoRedirectPage() {
  redirect("/combustible");
}
