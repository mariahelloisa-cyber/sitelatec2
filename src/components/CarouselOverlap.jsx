import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function CarouselOverlap({
  items,
  className,
  showPagination = true,
  showNavigation = true,
  loop = true,
  autoplay = true,
  spaceBetween = 40,
}) {
  const css = `
  .carousel-overlap {
    padding-bottom: 50px !important;
  }

  .carousel-overlap .swiper-pagination-bullet {
    background-color: #cd146e !important;
  }

  .carousel-overlap .swiper-button-next,
  .carousel-overlap .swiper-button-prev {
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
  .carousel-overlap .swiper-button-next:hover,
  .carousel-overlap .swiper-button-prev:hover {
    background: #a61058;
    transform: scale(1.08);
  }
  .carousel-overlap .swiper-button-prev {
    left: 4px;
  }
  .carousel-overlap .swiper-button-next {
    right: 4px;
  }
`;

  return (
    <div className={cn('relative w-full max-w-3xl mx-auto', className)}>
      <style>{css}</style>

      <Swiper
        spaceBetween={spaceBetween}
        autoplay={autoplay ? { delay: 2200, disableOnInteraction: false } : false}
        effect="coverflow"
        grabCursor
        centeredSlides
        loop={loop}
        slidesPerView={1.6}
        breakpoints={{
          768: { slidesPerView: 2.43 },
        }}
        coverflowEffect={{
          rotate: 0,
          slideShadows: false,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
        }}
        pagination={showPagination ? { clickable: true } : false}
        navigation={
          showNavigation
            ? { nextEl: '.carousel-overlap-next', prevEl: '.carousel-overlap-prev' }
            : false
        }
        className="carousel-overlap"
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id ?? index} className="!h-[320px] w-full">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200">
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
            <div className="carousel-overlap-prev swiper-button-prev after:hidden cursor-pointer flex items-center justify-center">
              <ChevronLeftIcon className="h-5 w-5 text-white shrink-0" />
            </div>
            <div className="carousel-overlap-next swiper-button-next after:hidden cursor-pointer flex items-center justify-center">
              <ChevronRightIcon className="h-5 w-5 text-white shrink-0" />
            </div>
          </>
        )}
      </Swiper>
    </div>
  );
}
