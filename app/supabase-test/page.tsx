import { supabase } from "@/app/lib/supabase";

export default async function SupabaseTestPage() {
  const { data, error } = await supabase
    .from("tickets")
    .select("*");

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">
        Supabase Connection Test
      </h1>

      {error ? (
        <pre className="text-red-600">
          {JSON.stringify(error, null, 2)}
        </pre>
      ) : (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}