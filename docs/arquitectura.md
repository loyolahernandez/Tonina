# Arquitectura Agéntica: Tonina B2B

Este documento mantiene el registro en código de los flujos automatizados de Tonina.
Puedes copiar y pegar estos bloques en herramientas como **Mermaid Live Editor** o directamente en el README de tu repositorio en GitHub para ver los diagramas generados.

## 1. El Bouncer (Triaje Comercial Autónomo)
*Estado: En construcción (Esperando Webhook de Make.com)*

```mermaid
sequenceDiagram
    participant Cliente (tonina.ai/links)
    participant Base de Datos (Supabase)
    participant Orquestador (Make.com)
    participant Cerebro IA (OpenAI/Anthropic)
    participant Ejecutor (WhatsApp API)

    Cliente (tonina.ai/links)->>Base de Datos (Supabase): Llena formulario B2B (Nombre, Empresa, Presupuesto)
    Base de Datos (Supabase)-->>Cliente (tonina.ai/links): 200 OK (Mensaje de éxito)
    
    note over Base de Datos (Supabase),Orquestador (Make.com): Supabase dispara un Trigger SQL
    Base de Datos (Supabase)->>Orquestador (Make.com): POST /webhook (JSON del Lead)
    
    Orquestador (Make.com)->>Cerebro IA (OpenAI/Anthropic): Envía datos (Presupuesto + Dolor)
    note over Cerebro IA (OpenAI/Anthropic): Prompt: Si budget < $1M CLP -> Rechazar. Si > $1M CLP -> Agendar.
    Cerebro IA (OpenAI/Anthropic)-->>Orquestador (Make.com): Respuesta (Aprobado/Rechazado) + Mensaje Redactado
    
    Orquestador (Make.com)->>Ejecutor (WhatsApp API): Envía el mensaje redactado al teléfono del cliente
    
    alt Aprobado
        Ejecutor (WhatsApp API)->>Cliente (tonina.ai/links): "Hola, tu problema encaja con nosotros. Agenda aquí: [Calendly]"
    else Rechazado
        Ejecutor (WhatsApp API)->>Cliente (tonina.ai/links): "Gracias por pensar en Tonina. Nuestros tickets parten en $1.5M..."
    end
```