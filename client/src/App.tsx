import { useEffect, useState } from 'react';
import { MessageSquare, Star, Film, Send } from 'lucide-react';

// datos
interface Movie {
  _id: string;
  name: string;
  runtimeInMinutes: number;
}

interface Review {
  id?: number;
  movie_id: string;
  user_name: string;
  content: string;
}

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // formulario
  const [newReview, setNewReview] = useState({ user_name: '', content: '' });

  // Cargar películas 
  useEffect(() => {
    fetch('http://localhost:3000/api/movies')
      .then(res => res.json())
      .then(data => {
        // La API externa devuelve los datos
        setMovies(data.docs || []); 
      })
      .catch(err => console.error("Error cargando películas:", err));
  }, []);

  // cargar reseñas 
  useEffect(() => {
    if (!selectedMovie) return;
        setReviews([]);

    fetch(`http://localhost:3000/api/reviews/${selectedMovie._id}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Error cargando reseñas:", err));
  }, [selectedMovie]);

  // envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) return;

    const payload = { 
      ...newReview, 
      movie_id: selectedMovie._id 
    };

    try {
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews([savedReview, ...reviews]);
        setNewReview({ user_name: '', content: '' });
      }
    } catch (error) {
      console.error("Error publicando reseña:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-amber-700 flex items-center justify-center gap-3">
            <Film className="w-10 h-10" />
            LOTR Reviews
          </h1>
          <p className="text-slate-500 mt-2">Selecciona una película y deja tu opinión</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Lista de Películas */}
          <div className="md:col-span-5 lg:col-span-4 space-y-3 h-[80vh] overflow-y-auto pr-2">
            <h2 className="text-xl font-bold text-slate-700 mb-4 px-2">Películas</h2>
            {movies.map(movie => (
              <div 
                key={movie._id} 
                onClick={() => setSelectedMovie(movie)}
                className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all duration-200 
                  ${selectedMovie?._id === movie._id 
                    ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' 
                    : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'
                  }`}
              >
                <h3 className="font-bold text-lg text-slate-800">{movie.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span>{movie.runtimeInMinutes} min</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reseñas y form */}
          <div className="md:col-span-7 lg:col-span-8">
            {selectedMovie ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Reseñas de <span className="text-amber-700">{selectedMovie.name}</span>
                  </h2>
                </div>

                {/* Formulario */}
                <div className="p-6 bg-slate-50/50">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Tu nombre" 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={newReview.user_name}
                      onChange={e => setNewReview({...newReview, user_name: e.target.value})}
                      required
                    />
                    <div className="relative">
                      <textarea 
                        placeholder="¿Qué te pareció la película?" 
                        className="w-full p-3 border border-slate-200 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        value={newReview.content}
                        onChange={e => setNewReview({...newReview, content: e.target.value})}
                        required
                      />
                      <button 
                        type="submit" 
                        className="absolute bottom-3 right-3 bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700 transition-colors shadow-sm"
                        title="Enviar reseña"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reviews */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {reviews.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No hay reseñas aún.</p>
                    </div>
                  ) : (
                    reviews.map((r, i) => (
                      <div key={i} className="border-b border-slate-100 pb-4 last:border-0 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center uppercase">
                            {r.user_name.charAt(0)}
                          </div>
                          {r.user_name}
                        </div>
                        <p className="text-slate-600 pl-10 text-sm leading-relaxed">{r.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-10">
                <Film className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Selecciona una película </p>
                <p className="text-sm">para ver sus reseñas</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;