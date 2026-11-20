
import { useState, useEffect } from 'react';
import './App.css';
import NoticiaCard from "./components/NoticiaCard/NoticiaCard.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [termino, setTermino] = useState("");
  const [busqueda, setBusqueda] = useState("");

  function buscar(evento) {
    evento.preventDefault();
    setTermino(busqueda.trim());
  }

  function buscarTema(texto) {
    setBusqueda(texto);
    setTermino(texto);
  }

  useEffect(() => {
    const controlador = new AbortController();

    async function obtenerNoticias() {
      try {
        setCargando(true);
        setError("");

        const parametros = new URLSearchParams({ limit: "6" });

        if (termino) {
          parametros.set("search", termino);
        }

        const respuesta = await fetch(
          `${API_URL}/articles/?${parametros.toString()}`,
          { signal: controlador.signal }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las noticias.");
        }

        const datos = await respuesta.json();
        setNoticias(datos.results);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    obtenerNoticias();

    return () => {
      controlador.abort();
    };
  }, [termino]);

  return (
    <>
      <header className="contenedor cabecera">
        <a className="logo" href="#inicio">Bitácora Espacial</a>

        <nav aria-label="Principal">
          <a href="#noticias">Noticias</a>
          <a href="Blog">Blog</a>
          <a href="#acerca">Acerca</a>
        </nav>
      </header>

      <main className="contenedor" id="inicio">
        <section className="hero">
          <h1>Explora las noticias del espacio</h1>
          <form className="buscador" onSubmit={buscar}>
            <label htmlFor="busqueda">Buscar por tema</label>
            <div className="buscador__campo">
              <input id="busqueda" name="q" type="search" placeholder="Ej.: Mars, Artemis, SpaceX" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)}
              />
              <button type="submit">Buscar</button>
            </div>
          </form>
          <div className="busquedas-rapidas">
            <span>Prueba la búsqueda:</span>
            <button type="button" onClick={() => buscarTema("Mars")}>Mars</button>
            <button type="button" onClick={() => buscarTema("Artemis")}>Artemis</button>
            <button type="button" onClick={() => buscarTema("SpaceX")}>SpaceX</button>
            <button type="button" onClick={() => buscarTema("xyz123sinresultados")}>Sin resultados</button>
            <button type="button" onClick={() => buscarTema("")}>Ver todas</button>
          </div>
        </section>
        <section className="seccion-noticias" aria-labelledby="ultimas-noticias" id="noticias">
          <div className="seccion-noticias__encabezado">
            <h2 id="ultimas-noticias">
              {termino ? `Resultados para "${termino}"` : "Últimas noticias de la muestra"}
            </h2>
            {!cargando && !error && (
              <span>{noticias.length} noticias</span>
            )}
          </div>
          {cargando && <p role="status">Cargando noticias...</p>}
          {error && <p role="alert">{error}</p>}
          {!cargando && !error && noticias.length === 0 && (
            <p role="status">No hay noticias para "{termino}".</p>
          )}
          {!cargando && !error && noticias.length > 0 && (
            <div className="grid-noticias">
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.title}
                  resumen={noticia.summary}
                  imagen={noticia.image_url}
                  fuente={noticia.news_site}
                  fecha={noticia.published_at}
                  enlace={noticia.url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="contenedor pie-pagina" id="acerca">
        <p>Datos proporcionados por Spaceflight News API.</p>
      </footer>
    </>
  );
}

export default App;
