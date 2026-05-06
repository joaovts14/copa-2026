import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "SUA_URL",
  "SUA_SERVICE_ROLE_KEY"
);

async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error(error);
    return;
  }

  for (const user of data.users) {
    const { error: deleteError } =
      await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Erro ao deletar:", deleteError);
    } else {
      console.log("Deletado:", user.email);
    }
  }
}

run();