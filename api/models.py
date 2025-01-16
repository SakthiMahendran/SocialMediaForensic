from django.db import models

class ForensicData(models.Model):
    url_id = models.AutoField(primary_key=True)
    url = models.URLField(unique=True)
    summary = models.TextField()

    def __str__(self):
        return self.url
