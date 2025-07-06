# Page snapshot

```yaml
- alert
- dialog:
  - heading "Build Error" [level=1]
  - paragraph: Failed to compile
  - text: Next.js (14.2.30) is outdated
  - link "(learn more)":
    - /url: https://nextjs.org/docs/messages/version-staleness
  - link "./04_impl/vision-holder-app/[delight]-main-application.tsx:26:1":
    - text: ./04_impl/vision-holder-app/[delight]-main-application.tsx:26:1
    - img
  - text: "Module not found: Can't resolve '@/components/ui/tabs' 24 | Loader 25 | } from 'lucide-react'; > 26 | import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; | ^ 27 | import { OnboardingWizard } from './components/[delight]-onboarding-wizard'; 28 | import { OnboardingTooltip } from './components/[delight]-onboarding-tooltip'; 29 |"
  - link "https://nextjs.org/docs/messages/module-not-found":
    - /url: https://nextjs.org/docs/messages/module-not-found
  - contentinfo:
    - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```