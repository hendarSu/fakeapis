"use server"

export async function submitEmail(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const email = formData.get("email")
  return {
    success: true,
    message: `Email ${email} submitted successfully!`,
  }
}
