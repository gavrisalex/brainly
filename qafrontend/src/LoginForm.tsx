"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import { useToast } from "./hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string(),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { toast } = useToast();
  const [usernameValid, setUsernameValid] = useState("");
  const [emailValid, setEmailValid] = useState("");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let email = values.email;
    let password = values.password;
    const user = { email, password };

    /*try {
      const {
        data: { success, data, error },
      } = await axios.post("http://localhost:8080/user/add", user);

      if (!success && error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    }*/
    console.log(email + " " + password);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-center items-center space-y-8 max-w-64 "
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="" {...field} />
              </FormControl>
              <FormDescription className="text-red-500">
                {emailValid}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
