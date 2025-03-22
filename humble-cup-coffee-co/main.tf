locals {
  images_s3_bucket_name = "humble-cup-coffee-co-images"
  domain_name           = "images.humblecupcoffee.com"
}

# resource "aws_route53_zone" "humble_cup_coffee_co_zone" {
#   name = "humblecupcoffee.com"
# }

resource "aws_route53_zone" "humble_cup_coffee_co_zone" {
  name = "humblecupcoffee.com"
}

module "images_s3_humble_cup" {
  source = "../modules/images-s3"

  providers = {
    aws = aws
  }

  bucket_name     = local.images_s3_bucket_name
  domain_name     = local.domain_name
  route53_zone_id = aws_route53_zone.humble_cup_coffee_co_zone.zone_id
}

output "images_s3_humble_cup_cloudfront_endpoint" {
  value       = module.images_s3_humble_cup.cloudfront_endpoint
  description = "The CloudFront endpoint for the images S3 bucket"
}