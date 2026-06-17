import { cookies } from "next/headers";
import Link from "next/link";
import { getAllProductRequests } from "@/services/retailers";

type ProductType = {
  id: string;
  status: string;
  createdAt: string;
};

export default async function Test() {
  const cookieStore = await cookies();
  const data = await getAllProductRequests(cookieStore.toString());
  return (
    <main>
      <p>Products</p>
      <Link href={`/retailers`}>Retailers</Link>
      {data.map((item: ProductType) => (
        <div key={item.id}>
          <p>{item.id}</p>
          <p>{item.status}</p>
          <p>{item.createdAt}</p>
        </div>
      ))}
    </main>
  );
}
