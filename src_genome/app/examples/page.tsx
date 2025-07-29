import { CardExamples } from "@/components/cards/examples"

export default function ExamplesPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tech-font">Card Components Examples</h1>
        <p className="text-muted-foreground">Ejemplos de uso de KpiCard e InsightCard components</p>
      </div>
      <CardExamples />
    </div>
  )
}
