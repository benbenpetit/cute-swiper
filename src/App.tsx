import './main.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import Lenis from '@studio-freight/lenis'
import clsx from 'clsx'
import throttle from 'lodash.throttle'

const getImageUrl = (x: string) => {
  return new URL(`/src/assets/img/${x}`, import.meta.url).href
}

type Item = {
  src: string
  alt: string
  rotate: number
}

const ITEMS: Item[] = [
  {
    src: getImageUrl('alone-car.avif'),
    alt: 'Voiture seule',
    rotate: 0.3,
  },
  {
    src: getImageUrl('jamaican.avif'),
    alt: "Bar qui s'appelle Jamaican",
    rotate: -0.3,
  },
  {
    src: getImageUrl('evening-breamy-houses.avif'),
    alt: 'Maisons entourées de brume',
    rotate: -0.1,
  },
  {
    src: getImageUrl('evening-home.avif'),
    alt: 'Maison de nuit',
    rotate: 0.3,
  },
  {
    src: getImageUrl('sea-pine.avif'),
    alt: 'Mer et pins',
    rotate: -0.2,
  },
  {
    src: getImageUrl('peaceful-city.avif'),
    alt: 'Rue paisible',
    rotate: 0.5,
  },
  {
    src: getImageUrl('san-fransisco-car.avif'),
    alt: 'Voiture à San Fransisco',
    rotate: -0.3,
  },
  {
    src: getImageUrl('sea.avif'),
    alt: 'Vue sur la mer de nuit avec la Lune brillante',
    rotate: 0.4,
  },
]

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

const BREAKPOINTS = [
  {
    window: 1600,
    imgRatio: 3.5,
  },
  {
    window: 960,
    imgRatio: 2.5,
  },
  {
    window: 0,
    imgRatio: 2,
  },
]

const App = () => {
  const reqFrame = useRef<number>(0)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const imgSize = useMemo(() => {
    const breakpoint = BREAKPOINTS.find(
      (bp) => window.innerWidth >= bp.window
    ) as (typeof BREAKPOINTS)[0]
    return windowWidth / breakpoint.imgRatio
  }, [windowWidth])
  const totalSize = useMemo(() => imgSize * ITEMS.length, [imgSize])
  const [isGrabbing, setIsGrabbing] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [lerpOffsetX, setLerpOffsetX] = useState(0)
  const [lerpScaleContainer, setLerpScaleContainer] = useState(1)
  const [lerpScaleItem, setLerpScaleItem] = useState(1)
  const [mouseDownX, setMouseDownX] = useState(0)
  const [endX, setEndX] = useState(0)
  const [autoIncr, setAutoIncr] = useState(0)
  const [isRight, setIsRight] = useState(false)

  useEffect(() => {
    const lenis = new Lenis()

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsGrabbing(true)
    setMouseDownX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isGrabbing) {
      setOffsetX(endX + e.clientX - mouseDownX)
      const movementX = e.movementX
      if (movementX === 0) return
      setIsRight(movementX > 0)
    }
  }

  const handleDragStop = () => {
    setIsGrabbing(false)
    setEndX(offsetX)
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    const debouncedHandleResize = throttle(handleResize, 20)

    window.addEventListener('resize', debouncedHandleResize)
    return () => window.removeEventListener('resize', debouncedHandleResize)
  }, [])

  const handleRaf = () => {
    if (!isGrabbing) {
      setAutoIncr(
        (prev) => prev + (isRight ? -windowWidth : windowWidth) / 1000
      )
    }
    setLerpScaleContainer((prev) => lerp(prev, isGrabbing ? 0.85 : 1, 0.1))
    setLerpScaleItem((prev) => lerp(prev, isGrabbing ? 1.15 : 1, 0.1))
    setLerpOffsetX((prev) => lerp(prev, offsetX * 1.5, 0.1))
    reqFrame.current = requestAnimationFrame(handleRaf)
  }

  useEffect(() => {
    reqFrame.current = requestAnimationFrame(handleRaf)

    return () => cancelAnimationFrame(reqFrame.current)
  }, [
    offsetX,
    lerpScaleContainer,
    lerpScaleItem,
    windowWidth,
    isRight,
    isGrabbing,
  ])

  return (
    <>
      <header>
        <h1>
          <a href="https://www.instagram.com/willemverb/" target="_blank">
            willem verbeeck
          </a>
        </h1>
        <h1>
          <a href="https://www.instagram.com/willemverb/" target="_blank">
            willem verbeeck
          </a>
        </h1>
        <h1>
          <a href="https://www.instagram.com/willemverb/" target="_blank">
            willem verbeeck
          </a>
        </h1>
        <h1>
          <a href="https://www.instagram.com/willemverb/" target="_blank">
            willem verbeeck
          </a>
        </h1>
        <h1>
          <a href="https://www.instagram.com/willemverb/" target="_blank">
            willem verbeeck
          </a>
        </h1>
      </header>
      <main>
        <section className="gallery">
          <div
            className={clsx('slider', isGrabbing && 'is-grabbing')}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragStop}
            onMouseLeave={handleDragStop}
          >
            <div className="slider__wrap">
              {ITEMS.map((item, index) => {
                const trimLerpOffsetX = (lerpOffsetX - autoIncr) % totalSize
                const position = trimLerpOffsetX + index * imgSize
                const translateX =
                  position < -imgSize * 2
                    ? totalSize + position
                    : position > totalSize - imgSize * 2
                    ? position - totalSize
                    : position

                return (
                  <div
                    key={index}
                    className="slider__item"
                    style={{
                      transform: `translate(0, -50%) translate3d(${translateX}px, 0, 0) rotate(${
                        item.rotate * 3
                      }deg) scale(${lerpScaleContainer})`,
                      width: `${imgSize}px`,
                    }}
                  >
                    <div
                      className="slider__img"
                      style={{ transform: `scale(${lerpScaleItem})` }}
                    >
                      <img src={item.src} alt={item.alt} draggable={false} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default App
