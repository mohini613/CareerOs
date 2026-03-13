"use client";

import React, { useId, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, SingleOrMultiple } from "@tsparticles/engine";
import { motion, useAnimation } from "framer-motion";
import { cn } from "../../lib/utils.js";

type ParticlesProps = {
  id?: string
  className?: string
  background?: string
  minSize?: number
  maxSize?: number
  speed?: number
  particleColor?: string
  particleDensity?: number
}

export const SparklesCore = (props: ParticlesProps) => {

  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity
  } = props

  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  const controls = useAnimation()

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: { duration: 1 }
      })
    }
  }

  const generatedId = useId()

  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>

      {init && (

        <Particles
          id={id || generatedId}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}

          options={{

            background:{
              color:{
                value: background || "#0da190"
              }
            },

            fullScreen:{
              enable:false,
              zIndex:10
            },

            fpsLimit:120,

            particles:{

              number:{
                density:{
                  enable:true,
                  width:400,
                  height:400
                },
                value: particleDensity || 120
              },

              color:{
                value: particleColor || "#ffffff"
              },

              opacity:{
                value:{ min:0.1,max:1 },
                animation:{
                  enable:true,
                  speed: speed || 4
                }
              },

              size:{
                value:{
                  min: minSize || 1,
                  max: maxSize || 3
                }
              },

              move:{
                enable:true,
                speed:{
                  min:0.1,
                  max:1
                }
              },

              shape:{
                type:"circle"
              }
            },

            detectRetina:true
          }}
        />

      )}

    </motion.div>
  )
}