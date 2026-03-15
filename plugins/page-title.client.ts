export default defineNuxtPlugin(() => {
  const defaultTitle = 'Tab.ninja - Free app keep track of and settle shared costs'
  const router = useRouter()

  router.beforeEach(() => {
    document.title = defaultTitle
  })
})
