This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Kiến trúc thư mục đề xuất
- https://chatgpt.com/s/t_6a786011f5848191a3fa450649068d22
- https://chatgpt.com/s/t_6a797302424081919c63eb7f3b5e568d

## Vấn đề Date và timezone
- Frontend và Backend đều quy định Date type
- Nhưng khi gửi qua lại qua http thì lại chỉ có thể gửi string
- Cần rất cẩn thận vấn đề timezone sẽ khiến dữ liệu không đồng nhất
- toISOString() thì trả về kiểu: 2001-08-09T00:00:00.000Z

## Checkbox shadcn
- tự thêm 1 div input absolute vào cuối cùng 
- Cách sửa thêm relative vào cha của chechbox là được

## Vấn đề dùng intlayer watch làm port 3000 ko thể kill được

```sh
pkill -f "next dev"
pkill -f "intlayer watch"
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill -9 $(lsof -t -i:3000) 
```