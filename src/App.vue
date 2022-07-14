<template>
  <router-view v-slot="{ Component }">
    <transition name="switch" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style lang="scss">
#app {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  &::before {
    position: absolute;
    content: "";
    inset: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle at center center, #47cbff, #36c6f0), repeating-radial-gradient(circle at center center, #47cbff, #47cbff, 90px, transparent 180px, transparent 90px);
    background-blend-mode: multiply;
    background-color: #36c6f0;
    will-change: transform;
    animation: fadeback 1s ease-in-out forwards;

    @keyframes fadeback {
      from {
        transform: scale(2)
      }

      to {
        transform: scale(1)
      }
    }
  }

  .switch-move,
  .switch-enter-active,
  .switch-leave-active {
    transition: opacity 0.7s ease-in-out, transform 0.7s ease-in-out;
  }

  .switch-enter-from,
  .switch-leave-to {
    opacity: 0;
    transform: translateY(20rem);
  }

  .switch-enter-to,
  .switch-leave-from {
    opacity: 1;
    transform: translateY(0rem);
  }
}
</style>
