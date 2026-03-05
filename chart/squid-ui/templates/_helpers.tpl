{{- define "squid-ui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "squid-ui.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "squid-ui.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end }}

{{- define "squid-ui.labels" -}}
app.kubernetes.io/name: {{ include "squid-ui.name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: squidstack
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{- define "squid-ui.selectorLabels" -}}
app.kubernetes.io/name: {{ include "squid-ui.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }} 