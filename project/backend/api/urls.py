from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cpvlicitacion', views.CpvlicitacionViewSet)
router.register(r'codigoscpv', views.CodigoscpvViewSet)
router.register(r'criterios', views.CriteriosViewSet)
router.register(r'empresas', views.EmpresasViewSet)
router.register(r'licitaciones', views.LicitacionesViewSet)
router.register(r'links', views.LinksViewSet)
router.register(r'participaciones', views.ParticipacionesViewSet)
router.register(r'tipocontrato', views.TipocontratoViewSet)
router.register(r'tipolink', views.TipolinkViewSet)
router.register(r'tipoprocedimiento', views.TipoprocedimientoViewSet)
router.register(r'tipotramitacion', views.TipotramitacionViewSet)
router.register(r'valoraciones', views.ValoracionesViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/<int:licitacion_id>/', views.StatisticsView.as_view(), name='statistics'),
    path('exportar_excel/', views.export_licitaciones, name='export_licitaciones'),
    path('run-script-extraccion/', views.run_script_extraccion, name='run_script'),
    path('cpv/<int:licitacion_id>/', views.CPVListView.as_view(), name='cpv-list'),
]
