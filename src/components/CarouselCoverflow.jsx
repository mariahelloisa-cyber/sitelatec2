import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function CarouselCoverflow({
  items,
  className,
  showPagination = true,
  showNavigation = true,
  loop = true,
  autoplay = true,
}) {
  const css = `
  .carousel-coverflow {
    width: 100%;
    height: 380px;
    padding-bottom: 50px !important;
  }

  .carousel-coverflow .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
  }

  .carousel-coverflow .swiper-pagination-bullet {
    background-color: #cd146e !important;
  }

  .carousel-coverflow .swiper-button-next,
  .carousel-coverflow .swiper-button-prev {
    top: calc(50% - 25px);
    width: 46px;
    height: 46px;
    margin-top: 0;
    background: #cd146e;
    border-radius: 9999px;
    box-shadow: 0 10px 25px rgba(205, 20, 110, 0.35);
    transition: background-color 0.2s ease, transform 0.2s ease;
    z-index: 20;
  }
  .carousel-coverflow .swiper-button-next:hover,
  .carousel-coverflow .swiper-button-prev:hover {
    background: #a61058;
    transform: scale(1.08);
  }
  .carousel-coverflow .swiper-button-next:active,
  .carousel-coverflow .swiper-button-prev:active {
    transform: scale(0.96);
  }
  .carousel-coverflow .swiper-button-prev {
    left: 4px;
  }
  .carousel-coverflow .swiper-button-next {
    right: 4px;
  }
  @media (min-width: 768px) {
    .carousel-coverflow .swiper-button-prev {
      left: 16px;
    }
    .carousel-coverflow .swiper-button-next {
      right: 16px;
    }
  }
`;

  return (
    <div className={cn('relative w-full max-w-5xl mx-auto px-5', className)}>
      <style>{css}</style>

      <Swiper
        effect="coverflow"
        grabCursor
        slidesPerView="auto"
        centeredSlides
        loop={loop}
        autoplay={autoplay ? { delay: 2600, disableOnInteraction: true } : false}
        coverflowEffect={{
          rotate: 40,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={showPagination ? { clickable: true } : false}
        navigation={
          showNavigation
            ? { nextEl: '.carousel-coverflow-next', prevEl: '.carousel-coverflow-prev' }
            : false
        }
        className="carousel-coverflow"
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id ?? index}>
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-xl">
              <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
              {item.titulo && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <h4 className="absolute bottom-0 left-0 right-0 p-5 text-white text-base font-extrabold tracking-wide uppercase leading-snug">
                    {item.titulo}
                  </h4>
                </>
              )}
            </div>
          </SwiperSlide>
        ))}

        {showNavigation && (
          <>
            <div className="carousel-coverflow-prev swiper-button-prev after:hidden cursor-pointer flex items-center justify-center">
              <ChevronLeftIcon className="h-5 w-5 text-white shrink-0" />
            </div>
            <div className="carousel-coverflow-next swiper-button-next after:hidden cursor-pointer flex items-center justify-center">
              <ChevronRightIcon className="h-5 w-5 text-white shrink-0" />
            </div>
          </>
        )}
      </Swiper>
    </div>
  );
}
