import z from "zod";
export const signinSchema=z.object({
    Email:z.string().email(),
    Password:z.string().min(8,"Password must be 8 character").max(30,"password at max 30 character"),
})