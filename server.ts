import app from './app';

if(!process.env.PORT){
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

app.listen(PORT, (): void => {
  console.log(`Server running on PORT: http://127.0.0.1:${PORT}`);
});