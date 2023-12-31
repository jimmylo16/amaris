import { MovieDetail } from "@/components/movies/MovieDetail";
import { useRouter } from "next/router";

export default function MoviePage() {
  const router = useRouter();
  return router.query.movieId ? (
    <MovieDetail movieId={router.query.movieId as string} />
  ) : null;
}
