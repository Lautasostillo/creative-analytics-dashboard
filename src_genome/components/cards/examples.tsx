"use client"

import { KpiCard } from "./kpi-card"
import { InsightCard } from "./insight-card"
import { TrendingUp, Zap, Target } from "lucide-react"

export function CardExamples() {
  return (
    <div className="space-y-8 p-6">
      {/* KPI Cards Examples */}
      <div>
        <h2 className="text-2xl font-bold mb-4">KPI Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Revenue" value="$124,500" delta={12.5} />

          <KpiCard title="Active Users" value="8,432" delta={-3.2} />

          <KpiCard title="Conversion Rate" value="3.24%" delta={8.1} />

          <KpiCard
            title="Average Order"
            value="$89.50"
            // Sin delta
          />
        </div>
      </div>

      {/* Insight Cards Examples */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Insight Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            title="Performance Trending Up"
            insight="Video creatives are showing 23% better performance this week compared to last week."
            type="trend"
            confidence={87}
            impact="high"
            detailedInsight="Análisis detallado muestra que los videos de 15-30 segundos están generando mayor engagement, especialmente en Instagram y TikTok. El CTR promedio ha aumentado de 2.1% a 2.6% en los últimos 7 días."
            actionItems={[
              "Incrementar presupuesto en creativos de video",
              "Crear más contenido de video corto",
              "Testear diferentes duraciones de video",
              "Analizar elementos creativos más exitosos",
            ]}
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <InsightCard
            title="Audience Optimization"
            insight="Consider reallocating 15% of Facebook budget to Instagram for better ROAS."
            type="recommendation"
            confidence={72}
            impact="medium"
            detailedInsight="El análisis de los últimos 30 días muestra que Instagram está generando un ROAS 23% superior al de Facebook para el mismo tipo de audiencia. La recomendación es redistribuir gradualmente el presupuesto."
            actionItems={[
              "Reducir presupuesto de Facebook en 15%",
              "Incrementar inversión en Instagram",
              "Monitorear performance durante 2 semanas",
              "Ajustar targeting si es necesario",
            ]}
          />

          <InsightCard
            title="Low Performance Alert"
            insight="Campaign 'Summer Sale' showing declining metrics over the past 3 days."
            type="alert"
            confidence={94}
            impact="high"
            detailedInsight="La campaña 'Summer Sale' ha experimentado una caída del 45% en CTR y 32% en conversiones. Posibles causas incluyen fatiga de audiencia o cambios en el algoritmo de la plataforma."
            actionItems={[
              "Pausar creativos con peor performance",
              "Refrescar audiencias",
              "Crear nuevos creativos",
              "Revisar configuración de campaña",
            ]}
          />

          <InsightCard
            title="Growth Opportunity"
            insight="Untapped potential in 25-34 age group showing high engagement but low spend allocation."
            type="opportunity"
            confidence={68}
            impact="medium"
            detailedInsight="El segmento de 25-34 años muestra un engagement rate 40% superior al promedio pero solo recibe el 12% del presupuesto total. Existe una oportunidad clara de crecimiento."
            actionItems={[
              "Incrementar targeting a 25-34 años",
              "Crear contenido específico para este segmento",
              "Testear diferentes formatos creativos",
              "Monitorear métricas de conversión",
            ]}
            icon={<Target className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Mixed Examples */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard Example</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KPIs Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-muted-foreground">Key Metrics</h3>
            <KpiCard title="Impressions" value="2.4M" delta={15.3} />
            <KpiCard title="CTR" value="2.8%" delta={-1.2} />
            <KpiCard title="ROAS" value="4.2x" delta={22.1} />
          </div>

          {/* Insights Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-muted-foreground">AI Insights</h3>
            <InsightCard
              title="Creative Refresh Needed"
              insight="Top performing creative showing signs of fatigue. Consider refreshing with new variants."
              type="recommendation"
              confidence={85}
              impact="medium"
              icon={<Zap className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
