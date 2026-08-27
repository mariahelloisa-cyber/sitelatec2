import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavoritosStore = create(
  persist(
    (set, get) => ({
      favoritos: [],
      favoritosAberto: false, // <-- controla se a aba de favoritos está visível ou oculta

      // Função para abrir ou fechar a aba de favoritos manualmente
      setFavoritosAberto: (aberto) => set({ favoritosAberto: aberto }),

      // Alterna: favorita se ainda não estiver salvo, remove se já estiver
      alternarFavorito: (curso) => {
        const favoritosAtuais = get().favoritos;
        const jaExiste = favoritosAtuais.some((item) => item.id === curso.id);

        if (!jaExiste) {
          set({
            favoritos: [...favoritosAtuais, curso],
            favoritosAberto: true, // <-- Abre a aba automaticamente ao favoritar!
          });
        } else {
          set({
            favoritos: favoritosAtuais.filter((item) => item.id !== curso.id),
          });
        }
      },

      removerDosFavoritos: (cursoId) => {
        set({
          favoritos: get().favoritos.filter((item) => item.id !== cursoId),
        });
      },

      limparFavoritos: () => set({ favoritos: [] }),
    }),
    {
      name: 'meus-favoritos-cursos',
      // Salva apenas a lista de cursos favoritados, ignorando se a aba estava aberta ou fechada
      partialize: (state) => ({ favoritos: state.favoritos }),
    }
  )
);
