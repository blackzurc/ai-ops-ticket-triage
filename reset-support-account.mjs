
import { createClient } from "@supabase/supabase-js";

const env = process.env;

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = "37908b8f-380e-4148-a2b9-5b9ad835feb1";

const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  {
    email: "blackzurc27@gmail.com",
    password: "Syazwan123",
    email_confirm: true,
  }
);

if (error) {
  console.error("Failed:", error.message);
} else {
  console.log("Account updated successfully!");
  console.log("Email:", data.user.email);
}
