resource "google_cloud_run_service" "backend" {
  name = "recycly-backend-nodeJs"
  location = var.region

  template {
    spec {
      containers {
        image = var.container_image
        resources {
          limits = {
            cpu = "1"
            memory = "512Mi"
          }
        }
      }
    }
  }

  traffic {
    percent = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_policy" "all_users" {
  location = google_cloud_run_service.backend.location
  service = google_cloud_run_service.backend.name

  policy_data = data.google_cloud_run_service_iam_policy.all_users.policy_data
}

data "google_iam_policy" "all_users" {
  binding {
    role = "roles/run.invoker"
    members = [ "allUsers" ]
  }
}
